import Footer from "./Footer";
import Section1 from "./Section1";
import Section2 from "./Section2";
import Section3 from "./Section3";
// import Section4 from "./Section4";

function Landing() {
  return (
    <div className="h-screen w-screen">
      <Section1 />
      <Section2 />
      <Section3 />
      {/* <Section4 /> */}
      <Footer />
    </div>
  );
}

export default Landing;
