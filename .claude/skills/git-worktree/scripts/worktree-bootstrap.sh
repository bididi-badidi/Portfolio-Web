#!/usr/bin/env bash
set -euo pipefail

usage() {
  local command_name
  command_name="$(basename "$0")"

  cat <<USAGE
Usage:
  $command_name add <path> <branch> [--base <ref>] [--env-source <path>] [--install|--no-install]
  $command_name setup <path> [--env-source <path>] [--install|--no-install]

Examples:
  $command_name add ../my-project/feature/my-branch feature/my-branch
  $command_name add ../my-project/existing-branch existing-branch
  $command_name add ../my-project/fix/issue fix/issue --base main --env-source .
  $command_name setup ../my-project/feature/my-branch --no-install

Environment:
  PACKAGE_MANAGER=auto|npm|bun|pnpm|yarn  Package manager for dependency install. Default: auto.
USAGE
}

die() {
  echo "worktree-bootstrap: $*" >&2
  exit 1
}

sync_from_origin() {
  local origin_url
  local current_branch

  origin_url="$(git remote get-url origin 2>/dev/null)" || {
    echo "No origin remote configured; skipped source checkout sync"
    return
  }

  echo "Syncing source checkout from origin"
  git fetch --prune origin

  current_branch="$(git branch --show-current)"
  if [[ -z "$current_branch" ]]; then
    echo "Detached HEAD; fetched origin but skipped pull"
    return
  fi

  if git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
    git merge --ff-only "@{u}"
  elif git show-ref --verify --quiet "refs/remotes/origin/$current_branch"; then
    git merge --ff-only "origin/$current_branch"
  else
    echo "No upstream or origin/$current_branch branch found; fetched origin but skipped pull"
  fi
}

copy_env_files() {
  local source_dir="$1"
  local target_dir="$2"
  local copied=0

  [[ -d "$source_dir" ]] || die "env source does not exist: $source_dir"

  shopt -s nullglob
  local env_files=("$source_dir"/.env "$source_dir"/.env.*)
  shopt -u nullglob

  for env_file in "${env_files[@]}"; do
    [[ -f "$env_file" ]] || continue
    cp -p "$env_file" "$target_dir/$(basename "$env_file")"
    copied=$((copied + 1))
  done

  if [[ "$copied" -eq 0 ]]; then
    echo "No .env files found in $source_dir"
  else
    echo "Copied $copied .env file(s) from $source_dir"
  fi
}

install_dependencies() {
  local target_dir="$1"
  local package_manager="${PACKAGE_MANAGER:-auto}"

  if [[ ! -f "$target_dir/package.json" ]]; then
    echo "No package.json found in $target_dir; skipped dependency install"
    return
  fi

  if [[ "$package_manager" == "auto" ]]; then
    if [[ -f "$target_dir/bun.lockb" || -f "$target_dir/bun.lock" ]]; then
      package_manager="bun"
    elif [[ -f "$target_dir/pnpm-lock.yaml" ]]; then
      package_manager="pnpm"
    elif [[ -f "$target_dir/yarn.lock" ]]; then
      package_manager="yarn"
    else
      package_manager="npm"
    fi
  fi

  case "$package_manager" in
    npm)
      (cd "$target_dir" && npm install)
      ;;
    bun)
      (cd "$target_dir" && bun install)
      ;;
    pnpm)
      (cd "$target_dir" && pnpm install)
      ;;
    yarn)
      (cd "$target_dir" && yarn install)
      ;;
    *)
      die "unsupported PACKAGE_MANAGER: $package_manager"
      ;;
  esac
}

mode="${1:-}"
[[ -n "$mode" ]] || {
  usage
  exit 1
}
shift

repo_root="$(git rev-parse --show-toplevel)"
env_source="$repo_root"
install="1"
base_ref=""

case "$mode" in
  add)
    target_path="${1:-}"
    branch="${2:-}"
    [[ -n "$target_path" && -n "$branch" ]] || {
      usage
      exit 1
    }
    shift 2
    ;;
  setup)
    target_path="${1:-}"
    [[ -n "$target_path" ]] || {
      usage
      exit 1
    }
    branch=""
    shift
    ;;
  -h|--help|help)
    usage
    exit 0
    ;;
  *)
    die "unknown mode: $mode"
    ;;
esac

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --base)
      base_ref="${2:-}"
      [[ -n "$base_ref" ]] || die "--base requires a ref"
      shift 2
      ;;
    --env-source)
      env_source="${2:-}"
      [[ -n "$env_source" ]] || die "--env-source requires a path"
      shift 2
      ;;
    --install)
      install="1"
      shift
      ;;
    --no-install)
      install="0"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
done

mkdir -p "$(dirname "$target_path")"

if [[ "$mode" == "add" ]]; then
  sync_from_origin

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    [[ -z "$base_ref" ]] || die "--base cannot be used with existing branch: $branch"
    git worktree add "$target_path" "$branch"
  elif [[ -n "$base_ref" ]]; then
    git worktree add -b "$branch" "$target_path" "$base_ref"
  else
    git worktree add -b "$branch" "$target_path"
  fi
fi

[[ -d "$target_path" ]] || die "target worktree does not exist: $target_path"

copy_env_files "$env_source" "$target_path"

if [[ "$install" == "1" ]]; then
  install_dependencies "$target_path"
else
  echo "Skipped dependency install"
fi

echo "Worktree ready: $target_path"
