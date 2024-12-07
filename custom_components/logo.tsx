interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo = ({ className, width, height }: LogoProps) => {
  return (
    <div className="logo">
      <svg
        width={width || 69}
        height={height || 75}
        viewBox="0 0 69 75"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M28.0003 1.26332L32.5 1.26343L5.00028 73.2633L0.000277437 73.2633L28.0003 1.26332Z"
          className="dark:fill-white fill-black"
        />
        <path
          d="M34.7734 2.76835L41.5 1.26343L68.0005 73.2177L62.0005 73.2177L34.7734 2.76835Z"
          className="dark:fill-white fill-black"
        />
        <path
          d="M34.5625 1.35417L41.6844 1.29852L13 73.2634L7.00016 73.2635L34.5625 1.35417Z"
          className="dark:fill-white fill-black"
        />
      </svg>
    </div>
  );
};

export default Logo;
