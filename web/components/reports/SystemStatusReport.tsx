export default function SystemStatusReport() { 

  return (
    <div className="text-sm">
      <h1 className="text-lg font-bold mb-5">System Status Report</h1>

      <div className="flex flex-col gap-5 mt-5">
        <StatusSection 
          title="Operation Summary" 
          items={[
            { label: "System Status", value: "Operational" },
            { label: "Battery Level", value: "45%" },
            { label: "Connection Status", value: "Connected" },
          ]}
        />

        <StatusSection 
          title="Hardware Status" 
          items={[
            { label: "Laser System", value: "Normal" },
            { label: "Navigation System", value: "Functional" },
            { label: "Sensors", value: "Maintenance Required" },
          ]}
        />

        <StatusSection 
          title="Maintenance Info" 
          items={[
            { label: "Last Maintenance", value: "03-15-2024" },
            { label: "Next Scheduled", value: "04-15-2024" },
            { label: "Operating Hours", value: "2450 hrs" },
          ]}
        />
      </div>
    </div>
  )
}

interface StatusSectionProps {
  title: string;
  items: { label: string; value: string }[];
}

function StatusSection({ title, items }: StatusSectionProps) {
  return (
    <div className="bg-secondary/80 rounded-lg p-6">
      <h1 className="text-lg font-bold mb-5">{title}</h1>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex flex-row justify-between p-3 rounded-lg bg-primary/20 text-primary">
            <h6 className="font-semibold">{item.label}</h6>
            <h6>{item.value}</h6>
          </div>
        ))}
      </div>
    </div>
  );
}