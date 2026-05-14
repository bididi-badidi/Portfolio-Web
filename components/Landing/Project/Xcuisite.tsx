import { ProjectHeading } from "../../Projects/ProjectHeading";
import { ProjectText } from "../../Projects/ProjectText";
import { ProjectDetail } from "../../Projects/ProjectDetail";
import { ScrollableSection } from "@/components/layout/ScrollableSection";

export function XcuisiteProject() {
  return (
    <ScrollableSection id="xcuisite">
      <ProjectHeading>XCuisite Ecommerce Website</ProjectHeading>
      <ProjectDetail className="sm:text-center" videoSrc="/videos/xcuisite/main-preview.mp4" multipleCol>
        <ProjectText>Doughnut e-commerce website</ProjectText>
      </ProjectDetail>
      <ProjectDetail className="sm:text-center" videoSrc="/videos/xcuisite/cart-preview.mp4" multipleCol>
        <ProjectText>Effective Cart System With Animations</ProjectText>
      </ProjectDetail>
      <ProjectDetail videoSrc="/videos/xcuisite/payment-preview.mp4" multipleCol className="sm:text-center">
        <ProjectText>Authentication and Payment Gateway Integration</ProjectText>
      </ProjectDetail>
    </ScrollableSection>
  );
}
