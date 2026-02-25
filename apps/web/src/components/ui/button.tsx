import React from "react";

const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

interface ButtonProps {
    variant?: "primary" | "secondary" | "tertiary" | "error" | "warning";
    size?: "tiny" | "small" | "medium" | "large";
    shape?: "default" | "rounded" | "square" | "circle";
    loading?: boolean;
    disabled?: boolean;
    shadow?: boolean;
    svgOnly?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const variantStyles = {
    primary: "bg-[#926F34] text-black hover:bg-[#B8944D] border-transparent",
    secondary: "bg-transparent text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)]",
    tertiary: "bg-transparent text-[var(--text-dim)] border-transparent hover:text-[var(--text)]",
    error: "bg-[var(--danger)] text-white border-transparent hover:opacity-90",
    warning: "bg-[var(--warning)] text-black border-transparent hover:opacity-90",
};

const sizeStyles = {
    tiny: "h-7 px-2 text-xs gap-1",
    small: "h-9 px-3 text-sm gap-1.5",
    medium: "h-11 px-4 text-sm gap-2",
    large: "h-13 px-6 text-base gap-2",
};

const shapeStyles = {
    default: "rounded-lg",
    rounded: "rounded-full",
    square: "rounded-lg aspect-square !px-0 justify-center",
    circle: "rounded-full aspect-square !px-0 justify-center",
};

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "medium",
    shape = "default",
    loading = false,
    disabled = false,
    shadow = false,
    svgOnly = false,
    prefix,
    suffix,
    children,
    className = "",
    onClick,
}) => {
    const base = "inline-flex items-center font-medium border transition-all duration-200 cursor-pointer";
    const dis = disabled || loading ? "opacity-50 cursor-not-allowed" : "";
    const sh = shadow ? "shadow-lg shadow-black/20" : "";

    return (
        <button
            className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyles[shape]} ${dis} ${sh} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? <LoadingSpinner /> : (
                <>
                    {prefix && <span className="flex-shrink-0 [&>svg]:fill-current">{prefix}</span>}
                    {!svgOnly && children && <span>{children}</span>}
                    {svgOnly && children}
                    {suffix && <span className="flex-shrink-0 [&>svg]:fill-current">{suffix}</span>}
                </>
            )}
        </button>
    );
};

export default Button;
