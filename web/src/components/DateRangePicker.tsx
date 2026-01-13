export default function DateRangePicker(props: {
  fromName?: string;
  toName?: string;
  fromDefault?: string;
  toDefault?: string;
  className?: string;
}) {
  const fromName = props.fromName ?? "from";
  const toName = props.toName ?? "to";

  return (
    <div className={props.className ?? ""}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="space-y-1">
          <div className="label">Check-in</div>
          <input type="date" name={fromName} defaultValue={props.fromDefault ?? ""} className="input" />
        </label>

        <label className="space-y-1">
          <div className="label">Check-out</div>
          <input type="date" name={toName} defaultValue={props.toDefault ?? ""} className="input" />
        </label>
      </div>

      <p className="help mt-2"></p>
    </div>
  );
}
