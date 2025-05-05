import Footer from "./Footer";
import Section1 from "./Section1";
import Section2 from "./Section2";
import Section3 from "./Section3";

function Landing({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="relative h-screen w-full overflow-x-hidden">
      <Section1 isLoggedIn={isLoggedIn} />
      <Section2 />
      <Section3 />
      <Footer />
    </div>
  );
}

export default Landing;
