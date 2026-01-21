'use client';

interface RadarChartProps {
  data: {
    representacion: number;
    abstraccion: number;
    estrategia: number;
    argumentacion: number;
    metacognicion: number;
    transferencia: number;
  };
  maxValue?: number;
  size?: number;
}

const DIMENSIONS = [
  { key: 'representacion', label: 'Representación', shortLabel: 'REP' },
  { key: 'abstraccion', label: 'Abstracción', shortLabel: 'ABS' },
  { key: 'estrategia', label: 'Estrategia', shortLabel: 'EST' },
  { key: 'argumentacion', label: 'Argumentación', shortLabel: 'ARG' },
  { key: 'metacognicion', label: 'Metacognición', shortLabel: 'MET' },
  { key: 'transferencia', label: 'Transferencia', shortLabel: 'TRA' }
];

export default function RadarChart({ data, maxValue = 4, size = 400 }: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 60;
  const levels = 4; // 4 achievement levels

  // Calculate points for the polygon
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / DIMENSIONS.length - Math.PI / 2;
    const distance = (value / maxValue) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  };

  // Create polygon path
  const points = DIMENSIONS.map((dim, i) => {
    const value = data[dim.key as keyof typeof data] || 0;
    const point = getPoint(i, value);
    return `${point.x},${point.y}`;
  }).join(' ');

  // Grid circles
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const r = (radius * (i + 1)) / levels;
    return (
      <circle
        key={i}
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="1"
      />
    );
  });

  // Axis lines
  const axisLines = DIMENSIONS.map((_, i) => {
    const point = getPoint(i, maxValue);
    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={point.x}
        y2={point.y}
        stroke="#E5E7EB"
        strokeWidth="1"
      />
    );
  });

  // Labels
  const labels = DIMENSIONS.map((dim, i) => {
    const labelDistance = radius + 40;
    const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
    const x = center + labelDistance * Math.cos(angle);
    const y = center + labelDistance * Math.sin(angle);
    
    return (
      <g key={i}>
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium fill-gray-700"
        >
          {dim.shortLabel}
        </text>
        <title>{dim.label}</title>
      </g>
    );
  });

  // Value points
  const valuePoints = DIMENSIONS.map((dim, i) => {
    const value = data[dim.key as keyof typeof data] || 0;
    if (value === 0) return null;
    const point = getPoint(i, value);
    return (
      <circle
        key={i}
        cx={point.x}
        cy={point.y}
        r="4"
        fill="#3B82F6"
        stroke="white"
        strokeWidth="2"
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid */}
        {gridCircles}
        {axisLines}
        
        {/* Data polygon */}
        <polygon
          points={points}
          fill="#3B82F6"
          fillOpacity="0.2"
          stroke="#3B82F6"
          strokeWidth="2"
        />
        
        {/* Value points */}
        {valuePoints}
        
        {/* Labels */}
        {labels}
      </svg>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {DIMENSIONS.map(dim => (
          <div key={dim.key} className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{dim.shortLabel}:</span>
            <span className="text-gray-600">{dim.label}</span>
            <span className="ml-auto font-semibold text-blue-600">
              {data[dim.key as keyof typeof data] || 0}/{maxValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}