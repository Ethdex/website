import * as _ from 'lodash';
import * as React from 'react';
import {Link} from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {colors} from 'material-ui/styles';
import {configs} from 'ts/utils/configs';
import {constants} from 'ts/utils/constants';
import {Styles, ProfileInfo, Partner} from 'ts/types';
import {
    Link as ScrollLink,
    Element as ScrollElement,
} from 'react-scroll';
import {utils} from 'ts/utils/utils';
import {Footer} from 'ts/components/footer';
import {TopBar} from 'ts/components/top_bar';
import {NewsletterInput} from 'ts/pages/home/newsletter_input';
import {Statistics} from 'ts/pages/home/statistics';
import ReactTooltip = require('react-tooltip');

export interface HomeProps {
    location: Location;
}

interface HomeState {}

const styles: Styles = {
    paragraph: {
        lineHeight: 1.4,
        fontSize: 18,
    },
    subheader: {
        textTransform: 'uppercase',
        fontSize: 32,
        margin: 0,
    },
    socalIcon: {
        fontSize: 20,
    },
};

export class Home extends React.Component<HomeProps, HomeState> {
    public render() {
        return (
            <div id="home">
             <section id="sidebar">
               <div className="inner">
                 <nav>
                 <ul>
                   <li><Link to="/">Home</Link></li>
                   <li><Link to="/otc">OTC</Link></li>
                 </ul>
                 </nav>
               </div>
             </section>

            <div id="wrapper">

	      <section className="wrapper style1-alt fullscreen fade-up">
	        <div className="inner">
                <h1 className="major">Ethdex</h1>

                <p>Ethdex is a system which enables atomic exchange of Ethereum tokens.</p>
                <p>We allow instant access to fluid and liquid token swaps.
As Ether        eum grows, token accrual and exchange becomes an integral piece of the user lifecycle. Ethdex does not rely on any additional token to operate, we are 100% non-rent seeking.</p>
                <p>Ethdex is currently live on the Rostpen network. Check it out with the <Link to="/otc"> OTC DApp </Link> </p>
	        <ul className="actions">
	        <li><a href="#what" className="button scrolly">Learn more</a></li>
	        <li><a href="#subscribe" className="button scrolly">Subscribe</a></li>
	        </ul>
	        </div>
	      </section>

             <section id="what" className="wrapper style3 fade-up">
               <div className="inner">
               <h2>What is Ethdex?</h2>
               <p>Ethdex is a protocol that enables the exchange of ERC20 tokens on-chain.</p>
               <div className="features">
               <section>
               <span className="icon major fa-chain"></span>
               <h3>Token Swap</h3>
               <p>Exchange your REP for some DNT. Sleep easy as the tokens never leave your control.</p>
               </section>
               <section>
               <span className="icon major fa-diamond"></span>
               <h3>100% Non-Rent Seeking</h3>
               <p>No specialised token is required for usage of the Ethdex protocol, simply Ether.</p>
               </section>
               <section>
               <span className="icon major fa-cog"></span>
               <h3>Incentives</h3>
               <p>Releays can receive fees paid by makers and takers in Ether.</p>
               </section>
               <section>
               <span className="icon major fa-desktop"></span>
               <h3>Works just like 0x Protocol</h3>
               <p>The Ethdex protocol is compliant with the 0x Protocol.</p>
               </section>
               </div>
               </div>
             </section>

             <section id="subscribe" className="wrapper style1-alt fade-up">
               <div className="inner">
               <h2>Stay tuned for details</h2>
               <div className="split style1">
               <section>
               <form action="//ethdex.us16.list-manage.com/subscribe/post?u=313fdf79928335a66bdadd3bf&amp;id=6c3faf40d4" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" >
               <div id="mc_embed_signup_scroll">
                 <label>Email</label>
                 <input type="email" name="EMAIL" className="email" id="mce-EMAIL" placeholder="email address" />
               </div>
               <ul className="actions">
                 <li><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" className="button submit" /></li>
               </ul>
               </form>
               </section>
               <section>
               <ul className="contact">
               <li>
               <h3>Social</h3>
               <ul className="icons">
               <li><a href="#" className="fa-twitter"><span className="label">Twitter</span></a></li>
               <li><a href="https://github.com/Ethdex/contracts" className="fa-github"><span className="label">GitHub</span></a></li>
               </ul>
               </li>
               </ul>
               </section>
               </div>
               </div>
             </section>

            </div>
            </div>
        );
    }
}
