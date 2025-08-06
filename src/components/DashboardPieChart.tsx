import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';

const COLORS = ['#F97316', '#22C55E', '#EF4444']; // Orange, Green, Red

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md border bg-white p-2 text-sm shadow-lg">
        <p className="font-semibold text-gray-900">{`${t(`estimate.status.${data.name.toLowerCase()}`)}`}</p>
        <p className="text-gray-600">{`${t('chart.count')}: ${data.value}`}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPieChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}