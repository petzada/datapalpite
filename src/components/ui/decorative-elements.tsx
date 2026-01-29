import { cn } from "@/lib/utils";

interface DecorativeProps {
    className?: string;
}

export function HandDrawnArrow({ className }: DecorativeProps) {
    return (
        <svg
            className={cn("w-24 h-24", className)}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M20 80C30 60 50 45 80 35"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M65 30L82 35L75 50"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}

export function DecoCurvedLines({ className }: DecorativeProps) {
    return (
        <svg
            className={cn("w-32 h-32", className)}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M10 100C30 80 60 90 90 60C100 50 110 30 100 20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M20 110C40 85 70 95 100 65"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
            />
        </svg>
    );
}

export function StarIcon({ className }: DecorativeProps) {
    return (
        <svg
            className={cn("w-6 h-6 inline-block", className)}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5L12 2Z" />
        </svg>
    );
}

export function WavyBackground({ className }: DecorativeProps) {
    return (
        <svg
            className={cn("absolute inset-0 w-full h-full", className)}
            viewBox="0 0 800 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
        >
            <path
                d="M0 100C100 80 200 120 300 100C400 80 500 120 600 100C700 80 800 120 800 100V0H0V100Z"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.15"
            />
            <path
                d="M0 200C100 180 200 220 300 200C400 180 500 220 600 200C700 180 800 220 800 200"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.15"
            />
            <path
                d="M0 300C100 280 200 320 300 300C400 280 500 320 600 300C700 280 800 320 800 300"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.15"
            />
            <path
                d="M0 400C100 380 200 420 300 400C400 380 500 420 600 400C700 380 800 420 800 400"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.15"
            />
            <path
                d="M0 500C100 480 200 520 300 500C400 480 500 520 600 500C700 480 800 520 800 500"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.15"
            />
            <ellipse cx="650" cy="450" rx="120" ry="120" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.1" />
            <ellipse cx="100" cy="150" rx="80" ry="80" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.1" />
        </svg>
    );
}

export function CircleDecor({ className }: DecorativeProps) {
    return (
        <div className={cn("w-2 h-2 rounded-full bg-primary", className)} />
    );
}

export function DecoSquare({ className }: DecorativeProps) {
    return (
        <div className={cn("w-16 h-16 bg-primary rounded-lg", className)} />
    );
}
