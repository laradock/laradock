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
    link: "https://smart.sista.ai/?utm_source=laradock&utm_medium=sponsor_banner&utm_campaign=landing_page",
    imageUrl: "/img/sponsors/sista-ai-logo.png",
    description: (
      <>
        <b>Plug-and-Play <a href="https://smart.sista.ai/?utm_source=laradock&utm_medium=sponsor_banner&utm_campaign=landing_page" target="_blank" style={{ color: '#8098f8' }}>AI Agents</a> for Apps & Websites</b>
      </>
    ),
  },
];

function Sponsor({ link, imageUrl, description }: SponsorItem) {
  return (
    <div className={clsx("col col--12")}>
      <div className="text--center">
        <a href={link} target="_blank" rel="noopener noreferrer">
          <img 
            src={imageUrl} 
            className={sponsorsStyles.sponsorImg} 
            role="img"
            style={{ 
              maxWidth: '100%',
              minWidth: '350px',
              height: 'auto'
            }} 
          />
        </a>
      </div>
      <div className="text--center padding-horiz--md">
        
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.2em)',
          lineHeight: 1.5,
          margin: '1rem 0'
        }}>{description}</p>
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
