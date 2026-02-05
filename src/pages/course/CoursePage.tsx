import Categories from "./Categories"
import GetChoise from "./GetChoise"
import RecommendForYou from "./RecommendForYou"

import WelcomeBack from "./WelcomeBack"

function CoursePage() {
  return (
    <>
    <WelcomeBack />
    <div className="mx-auto max-w-8xl px-6">
        <Categories />
        <RecommendForYou />
        <GetChoise />
    </div>
    </>
  )
}

export default CoursePage