import CloudSoftware from "../../components/cloud/CloudSoftware"
import Courses from "../../components/course/Courses"
import Everything from "../../components/everything/Everything"
import Features from "../../components/features/Features"
import Footer from "../../components/footer/Footer"
import Header from "../../components/header/Header"
import LatestNews from "../../components/latest_news/LatestNews"
import Hero from "../../components/main/Hero"
import OurSuccess from "../../components/success/OurSuccess"
import Testemonial from "../../components/testemonial/Testemonial"
import Discussion from "../../components/tools/Discussion"
import Management from "../../components/tools/Management"
import Question from "../../components/tools/Questions"
import Tools from "../../components/tools/Tools"
import What from "../../components/what_is_totc/What"

function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <OurSuccess />
      <CloudSoftware />
      <What />
      <Everything />
      <Features />
      <Tools />
      <Question />
      <Management />
      <Discussion />
      <Courses />
      <Testemonial />
      <LatestNews />
      <Footer />
    </div>
  )
}

export default Home