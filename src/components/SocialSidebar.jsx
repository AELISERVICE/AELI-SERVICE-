import React from 'react';
import { TwitterIcon, FacebookIcon, InstagramIcon } from 'lucide-react';


export function SocialSidebar() {
    return (
        <aside
            className="flex lg:flex md:fixed md:left-0 md:top-1/2 -translate-y-1/2 z-40 md:flex-col  md:bg-black rounded-tr-lg rounded-br-lg gap-4 md:gap-0 mt-4 md:mt-auto justify-center "
            aria-label="Social media links"
        >
            <a
                href="#twitter"
                className=" w-9 h-9 md:w-13 md:h-13 bg-black flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200  rounded-full md:rounded-none md:first:rounded-tr-lg"
                aria-label="Twitter"
            >
                <TwitterIcon className="w-5 h-5" />
            </a>
            <a
                href="#facebook"
                className=" w-9 h-9 md:w-13 md:h-13 bg-black flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 rounded-full md:rounded-none"
                aria-label="Facebook"
            >
                <FacebookIcon className="w-5 h-5" />
            </a>
            <a
                href="#instagram"
                className=" w-9 h-9 md:w-13 md:h-13 bg-black flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 rounded-full md:rounded-none md:rounded-br-lg"
                aria-label="Instagram"
            >
                <InstagramIcon className="w-5 h-5" />
            </a>
        </aside>
    )
}
