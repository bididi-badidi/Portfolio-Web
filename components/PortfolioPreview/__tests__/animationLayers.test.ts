import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { AnimationClip, Group, NumberKeyframeTrack, Object3D } from 'three';
import { createAnimationLayers } from '../animationLayers';

const bytes = readFileSync('public/models/reference-full-body-v5-layered.glb');
const data = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());

describe('layered GLB', () => {
  test('blink and wake animate both eye apertures and their radiance', () => {
    const binaryStart=28+bytes.readUInt32LE(12);
    const samples=(index:number) => {
      const accessor=data.accessors[index],view=data.bufferViews[accessor.bufferView];
      return Array.from({length:accessor.count},(_,i)=>bytes.readFloatLE(binaryStart+(view.byteOffset??0)+(accessor.byteOffset??0)+i*4));
    };
    for(const name of ['BlinkFace','WakeFace']){
      const clip=data.animations.find((a:{name:string})=>a.name===name);
      expect(clip.channels).toHaveLength(5);
      for(const channel of clip.channels){
        const values=samples(clip.samplers[channel.sampler].output);
        expect(Math.max(...values)).toBe(1);
        expect(values.at(-1)).toBe(0);
        expect(values[0]).toBe(name==='WakeFace'?1:0);
      }
    }
  });
  test('body, gestures, jaw and blink own disjoint properties', () => {
    expect(data.animations.map((clip: {name: string}) => clip.name)).toEqual(expect.arrayContaining([
      'WalkingBody',
      'WalkingUpperBody',
    ]));
    const groups = new Map<string, Set<string>>();
    for (const clip of data.animations) {
      const layer = clip.name.endsWith('UpperBody') ? 'upper' : clip.name.endsWith('Body') ? 'body' : /Blink|Wake/.test(clip.name) ? 'eyes' : 'mouth';
      const properties = groups.get(layer) ?? new Set<string>();
      for (const channel of clip.channels) properties.add(`${channel.target.node}:${channel.target.path}`);
      groups.set(layer, properties);
    }
    expect(groups.size).toBe(4);
    for (const [a, properties] of groups) for (const [b, other] of groups) {
      if (a !== b) expect([...properties].filter(p => other.has(p))).toEqual([]);
    }
    for (const name of ['MouthClosedFace','MouthSmallFace','MouthMediumFace','MouthLargeFace','TalkFace']) {
      const clip = data.animations.find((a: {name: string}) => a.name === name);
      expect(clip.channels).toHaveLength(1);
      expect(data.nodes[clip.channels[0].target.node].name).toBe('Jaw');
    }
  });
});

function fixture() {
  const root = new Group();
  for (const name of ['body','upper','mouth','eyes']) { const child = new Object3D(); child.name=name;root.add(child); }
  const clips = data.animations.map((a: {name: string}) => {
    const layer = a.name.endsWith('UpperBody') ? 'upper' : a.name.endsWith('Body') ? 'body' : /Blink|Wake/.test(a.name) ? 'eyes' : 'mouth';
    const value = a.name === 'ListenBody' ? 4 : a.name === 'TalkFace' ? 3 : a.name === 'WaveUpperBody' ? 2 : 1;
    return new AnimationClip(a.name, 1, [new NumberKeyframeTrack(`${layer}.position[x]`, [0,1],[value,value])]);
  });
  return { root, layers: createAnimationLayers(root,clips) };
}

test('resting uses ListenBody with eyes open, including boot and returning from overrides', () => {
  const {root,layers}=fixture();
  layers.mixer.update(0);
  expect(root.getObjectByName('body')!.position.x).toBe(4);
  expect(root.getObjectByName('eyes')!.position.x).toBe(0);
  for(let i=0;i<20;i++)layers.update(.05,{},true);
  expect(root.getObjectByName('eyes')!.position.x).toBe(0);
  for(let i=0;i<10;i++)layers.update(.05,{body:'IdleBody',blinking:true});
  expect(root.getObjectByName('body')!.position.x).toBe(1);
  expect(root.getObjectByName('eyes')!.position.x).toBe(1);
  for(let i=0;i<10;i++)layers.update(.05,{});
  expect(root.getObjectByName('body')!.position.x).toBe(4);
  expect(root.getObjectByName('eyes')!.position.x).toBe(0);
  layers.dispose();
});

test('talk continues while gestures advance, repeat, and return to idle', () => {
  const {root,layers} = fixture();
  const controls = {talking:true, sequence:{id:1,clips:['PointUpperBody','WaveUpperBody','WaveUpperBody'] as const}};
  const seen = new Set<string | undefined>();
  for(let i=0;i<100;i++) {
    layers.update(.05,{...controls,sequence:{...controls.sequence,clips:[...controls.sequence.clips]}});
    seen.add(layers.snapshot().upper);
    if (i > 5) expect(root.getObjectByName('mouth')!.position.x).toBeCloseTo(3);
  }
  expect([...seen]).toContain('WaveUpperBody');
  expect(layers.snapshot().upper).toBe('IdleUpperBody');
  expect(layers.snapshot().queued).toBe(0);
  layers.dispose();
});

test('interruptions blend continuously without dropping to the rest pose', () => {
  const {root,layers}=fixture();
  const first = {talking:true,sequence:{id:1,clips:['PointUpperBody'] as const}};
  for(let i=0;i<10;i++) layers.update(.05,{...first,sequence:{...first.sequence,clips:[...first.sequence.clips]}});
  const before = root.getObjectByName('upper')!.position.x;
  layers.update(.01,{talking:true,sequence:{id:2,clips:['WaveUpperBody']}});
  expect(Math.abs(root.getObjectByName('upper')!.position.x-before)).toBeLessThan(.01);
  for(let i=0;i<10;i++) layers.update(.05,{talking:true,sequence:{id:2,clips:['WaveUpperBody']}});
  expect(root.getObjectByName('upper')!.position.x).toBeGreaterThan(1.5);
  expect(root.getObjectByName('mouth')!.position.x).toBeCloseTo(3);
  layers.dispose();
});

test('split walking loops body and upper-body actions concurrently', () => {
  const {root,layers}=fixture();
  for(let i=0;i<60;i++) layers.update(.05,{body:'WalkingBody',upper:'WalkingUpperBody'});
  expect(layers.snapshot().upper).toBe('WalkingUpperBody');
  expect(root.getObjectByName('body')!.position.x).toBeCloseTo(1);
  expect(root.getObjectByName('upper')!.position.x).toBeCloseTo(1);
  layers.dispose();
});

test('presenting spends most time in defaults with spaced expressive gestures', () => {
  const {layers}=fixture();
  let expressiveFrames=0;
  const defaults=new Set<string>();
  for(let i=0;i<1200;i++) {
    layers.update(.05,{mode:'presenting',talking:true});
    const state=layers.snapshot();
    if(state.expressive) expressiveFrames++;
    else defaults.add(state.upper!);
    if(i<270) expect(state.expressive).toBe(false);
  }
  expect(defaults.size).toBeGreaterThan(1);
  expect(expressiveFrames).toBeGreaterThan(0);
  expect(expressiveFrames).toBeLessThan(240);
  layers.dispose();
});

test('defaults-only suppresses automatic accents and mode exit cancels them', () => {
  const {layers}=fixture();
  for(let i=0;i<800;i++) {
    layers.update(.05,{mode:'presenting',sporadic:false});
    expect(layers.snapshot().expressive).toBe(false);
  }
  layers.update(.05,{mode:'presenting',sequence:{id:1,clips:['WaveUpperBody']}});
  expect(layers.snapshot().expressive).toBe(true);
  layers.update(.05,{mode:'idle'});
  expect(layers.snapshot().upper).toBe('IdleUpperBody');
  expect(layers.snapshot().expressive).toBe(false);
  layers.dispose();
});
