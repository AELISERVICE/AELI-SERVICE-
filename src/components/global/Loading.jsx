import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import animationData from '../../assets/Loading.json';

export function Loading() {
    return (
        <div className="flex items-center justify-center flex-1 w-full h-full">
            <div className="w-35 h-35">
                <DotLottieReact
                    data={animationData}
                    loop
                    autoplay
                />
            </div>
        </div>
    );
};