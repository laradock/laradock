import type { ReactNode } from "react";
import Content from "@theme-original/DocSidebar/Desktop/Content";
import type ContentType from "@theme/DocSidebar/Desktop/Content";
import type { WrapperProps } from "@docusaurus/types";
import SidebarSponsor from "@site/src/components/SidebarSponsor";

type Props = WrapperProps<typeof ContentType>;

// Appends the sponsor progress widget below the nav, on every docs page.
export default function ContentWrapper(props: Props): ReactNode {
  return (
    <>
      <Content {...props} />
      <SidebarSponsor />
    </>
  );
}
