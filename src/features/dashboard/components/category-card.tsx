type CategoryCardProps = {
  items: Array<{
    id: string;
    label: string;
    percentage: number;
    colorClassName: string;
  }>;
};

export function CategoryCard({ items }: CategoryCardProps) {
  return (
    <article className="border border-border bg-surface p-5">
      <h2 className="text-[1.35rem] font-semibold tracking-tight text-primary sm:text-[1.45rem]">
        Gastos por Categoria
      </h2>

      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between gap-4 text-sm sm:text-[0.95rem]">
              <span className="uppercase tracking-[0.06em]">{item.label}</span>
              <span>{item.percentage}%</span>
            </div>

            <div className="mt-2 h-3 w-full rounded-full bg-primary-soft">
              <div
                className={`h-3 rounded-full ${item.colorClassName}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
