import Image from "next/image";
import Link from "next/link";
import { FOOTER_LAST_UPDATE } from "@/app/config";

export const Footer = () => {
  const year = new Date().getFullYear();
  const footerIcons = [
    {
      link: "https://www.linkedin.com/in/zi-shen-chan/",
      icon: "/icons/linkedin.png",
      name: "linked-in-icon",
    },
    {
      link: "https://github.com/ZSHenChan",
      icon: "/icons/github.png",
      name: "github-icon",
    },
    {
      link: "https://medium.com/@zishenchan",
      icon: "/icons/medium.png",
      name: "medium-icon",
    },
  ];
  const footerLinks = [
    {
      link: "/",
      name: "Home",
    },
    {
      link: "/#projects",
      name: "Projects",
    },
    {
      link: "/#contact",
      name: "Contact",
    },
    {
      link: "/projects/personal-ai",
      name: "Personal AI",
    },
  ];
  return (
    <div className="relative min-h-[45dvh] bg-black-20 py-[10dvh] px-[10dvw] flex flex-col justify-between">
      <div className="absolute top-12 h-[0.5px] w-[60%] left-[50%] translate-x-[-50%] bg-bright/20" />
      <ul className="flex flex-col lg:flex-row justify-center text-center mb-8 gap-4 lg:gap-12">
        {footerLinks.map((item) => (
          <li key={item.name}>
            <Link className="font-bold text-xl cursor-pointer hover:text-bright/80" href={item.link}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="flex justify-center gap-12 pb-8">
        {footerIcons.map((item) => (
          <li key={item.icon}>
            <a className="cursor-pointer " href={item.link}>
              <Image
                className="bg-bright rounded-[50%]"
                src={item.icon}
                width={32}
                height={32}
                alt={item.name}
              ></Image>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-center text-slate-600">
        &copy; {year} Zi Shen Chan. All Rights Reserved. Last update: {FOOTER_LAST_UPDATE}
      </p>
    </div>
  );
};
