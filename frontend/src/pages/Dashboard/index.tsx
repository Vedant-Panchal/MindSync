import Heatmap from "@/components/Heatmap";
import { SectionCards } from "@/components/section-cards";

// import { useKiteUser } from "@/hooks/kite";
import { SectorPieChart } from "@/components/SectorPieChart";
import { StockRecommendations } from "@/components/StockRecommendations";

export default function Dashboard() {
  // const { data } = useKiteUser();
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="grid grid-cols-2 gap-5">
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                Sector Wise Chart
              </h2>
              <SectorPieChart />
            </div>
            <div className="bg-white overflow-hidden rounded-lg shadow-xl">
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                NIFTY 50 Heatmap
              </h2>
              <Heatmap />
            </div>
          </div>
          {/* <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div> */}
          <StockRecommendations />
        </div>
      </div>
      {/* {JSON.stringify(data)} */}
    </div>
  );
}
