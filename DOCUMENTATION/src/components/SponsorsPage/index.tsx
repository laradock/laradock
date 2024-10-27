import clsx from "clsx";
import Heading from "@theme/Heading";
import sponsorsStyles from "./styles.module.css";

type SponsorItem = {
  link: string;
  imageUrl: string;
  description: JSX.Element;
};

const SponsorList: SponsorItem[] = [
  {
    link: "https://smart.sista.ai/?utm_source=docs_laradock&utm_medium=sponsor&utm_campaign=landing_page_welcome",
    imageUrl: "/Porto/img/sponsors/sista-ai-logo.png",
    description: (
      <>
        <b>Make Your Apps Smarter with a Plug-and-Play AI Voice Assistant.</b>
      </>
    ),
  },
];

function Sponsor({ link, imageUrl, description }: SponsorItem) {
  return (
    <div className={clsx("col col--12")}>
      <div className="text--center">
        <a href={link} target="_blank" rel="noopener noreferrer">
          <img src={imageUrl} className={sponsorsStyles.sponsorImg} role="img" />
        </a>
      </div>
      <div className="text--center padding-horiz--md">
        
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function SponsorsPage(): JSX.Element {
  return (
    <section className={sponsorsStyles.sponsors}>
      <div className="container">
        <div className="row">
          {SponsorList.map((props, idx) => (
            <Sponsor key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
