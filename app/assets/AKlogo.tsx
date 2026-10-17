interface Props {
  isDarkMode?: boolean;
  height?: number;
  width?: number;
  style?: React.CSSProperties;
  className?: string;
}

const AKlogo = ({
  isDarkMode = false,
  height = 24,
  width = 24,
  style,
  className,
}: Props) => {
  return (
    <svg
      viewBox="0 0 1300 1300"
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={width}
      style={style}
      className={className}
      xmlSpace="preserve"
    >
      <path d="M440 336h86v75h-86z" fill="none" />
      <path
        className="st48"
        d="M948 1003v-26h-8l-3 1-2 2c-1 0-2 1-2 3v22h-20v-28h-27c-4 0-7 3-8 8v26l1 3 1 3 3 2 3 1h7v-29h5v20l1 4 3 3a8 8 0 0 0 6 2h28a11 11 0 0 0 8-4l3-5a20 20 0 0 0 1-7v-1zm-336-20a9 9 0 0 0-6-6h-33l-3-2-1-1-1-3 1-2a119 119 0 0 1 3-9l2-5 2-4 1-2h-16l-3 7-4 7-2 8-2 8 1 4 3 4 4 3 6 1h6a1496 1496 0 0 0 22 0h6v14h-53v-28h-38c-4 0-7 3-7 8a6239 6239 0 0 0 0 27c-1 5 1 8 6 8h25l-3 6a32 32 0 0 1-8 11l-6 4h18c4-3 7-6 9-10 2-3 4-7 4-11h56l5-1 4-2c1 0 2-1 2-3l1-5v-20l-1-6zm-82 22h-15v-14h15v14zm128-23 1 5 1 2 2 2h26v14h-54v6l1 3a8 8 0 0 0 4 5l3 1h50l5-1 3-2 2-3 1-4v-33h-45v5zm-166-5h-8l-3 1-2 2-2 3v22h-29v-28h-32c-3 0-5 0-6 2l-2 6v20h-56v7c0 5 2 8 7 8h52a11 11 0 0 0 8-4l3-5 1-6v-14h10v14c0 5 1 9 3 11 2 3 5 4 8 4h36a11 11 0 0 0 8-4l3-5 1-6v-28z"
        fill={isDarkMode ? '#fff' : 'currentColor'}
      />
      <path
        className="st48"
        d="M517 957a4 4 0 0 0-3 1 4 4 0 0 0-1 3v9l1 1 2 1 2 1h9l2-1 2-1 1-1v-11l-1-1-3-1h-4v8h-3v-8h-4zm415-11-2 1a6 6 0 0 0-2 4 8 8 0 0 0 0 4l1 2 7 7h-9v4c-1 3 1 4 3 4h11l4-2 2-4-1-3-4-5-4-4h9v-4c0-2-1-4-3-4h-12zm-61 47v-16h-51v5l1 5 1 2 3 2h31v14h-51v-28h-37c-5 0-7 3-8 8v20h-15v-28h-27c-5 0-7 3-8 8v26l1 3 1 3a8 8 0 0 0 6 3h7v-29h5v20l1 4 2 3a8 8 0 0 0 7 2h120l8-4c2-1 3-4 3-6v-17zm-81 12h-15v-14h15v14zm-329 22h12v12h-12zm14 0h12v12h-12z"
        fill={isDarkMode ? '#fff' : 'currentColor'}
      />
      <path
        className="st49"
        d="M732 822c43-7 80-8 105-7V259l-19 2 1 539a1482 1482 0 0 0-124 27l2 2 35-7z"
        fill={isDarkMode ? '#fff' : 'currentColor'}
      />
      <path
        className="st49"
        d="M760 849c44-7 81-8 106-7V286l-19 1 1 540a1190 1190 0 0 0-120 27l2 1 30-6z"
        fill={isDarkMode ? '#fff' : 'currentColor'}
      />
      <path
        className="st49"
        d="M762 880a566 566 0 0 1 133-12V312l-19 2v539a1612 1612 0 0 0-108 23l-9 2 1 1 2 1z"
        fill={isDarkMode ? '#fff' : 'currentColor'}
      />
      <path
        className="st48"
        d="M559 261H407c-29 0-53 24-53 53v624h86V487h86v75h86V314c0-29-24-53-53-53zm-33 150h-86v-75h86v75z"
        fill={isDarkMode ? '#fff' : 'currentColor'}
      />
      <path
        className="st48"
        d="M612 637h-86v301h86v-80l53 42 32 25c29 23 73 15 99-17a865 865 0 0 1 150-13V335l-32 3v542a2415 2415 0 0 0-118 25l-1 1-33-26-2-1-1-1-2-2-27-21-2-1-1-1-2-2-28-22-2-2-2-1-2-2-39-30 77-61c-25-32-65-44-88-26l-29 23v-93z"
        fill={isDarkMode ? '#fff' : 'currentColor'}
      />
    </svg>
  );
};

export default AKlogo;
