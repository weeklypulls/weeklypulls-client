import { Alert } from "antd";

export default function ErrorList({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return (
    <Alert
      type="error"
      showIcon
      style={{ marginBottom: 12 }}
      title={
        errors.length === 1 ? (
          errors[0]
        ) : (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )
      }
    />
  );
}
