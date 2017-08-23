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
import {TeamAndAdvisors} from 'ts/pages/home/team_and_advisors';
import {Partnerships} from 'ts/pages/home/partnerships';
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
            <div id="home" style={{color: colors.grey800}}>
                <TopBar
                    blockchainIsLoaded={false}
                    location={this.props.location}
                />
                <div
                    className="lg-pb4 md-pb4 sm-pb2 sm-pt0 md-pt4 lg-pt4 mx-auto max-width-4"
                >
                    <div className="lg-pb4 md-pb4 clearfix">
                        <div className="md-col md-col-6 pt4">
                            <div className="pt4 md-pl2 sm-center xs-center sm-hide xs-hide">
                                <div className="pt2">
                                    <img
                                        src="/images/0x_city_square.png"
                                        style={{width: '60%'}}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="md-col md-col-6 sm-col-12 xs-col-12 lg-pt4 md-pt4">
                            <div className="lg-pt4 md-pt4 sm-px4 md-px0 lg-px0">
                                <div className="pt3 sm-hide xs-hide">
                                  <h1>Ethdex</h1>
                                </div>
                                <div className="pt4 md-hide lg-hide center">
                                </div>
                                <div className="pt2 lg-pb2 md-pb2 sm-pb3 sm-h2 sm-center">
                                    <span className="lg-hide md-hide">
                                    </span>
                                    {' '}Fluid Token Exchange
                                </div>
                                <div className="flex sm-hide xs-hide">
                                    <Link to="/otc">
                                        <RaisedButton
                                            label="OTC"
                                            primary={true}
                                            style={{marginRight: 12}}
                                            buttonStyle={{width: 136}}
                                        />
                                    </Link>
                                    <a
                                        target="_blank"
                                        href="/white_paper.pdf"
                                    >
                                        <FlatButton
                                            label="Whitepaper"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    style={{backgroundColor: '#272727'}}
                >
                    <div className="clearfix mx-auto max-width-4 pb2" style={{color: 'white'}}>
                        <div className="col lg-col-6 md-col-6 sm-col-12 sm-px2 sm-pb4">
                            <h1
                                className="pt4 sm-center md-pl3 lg-pl0 thin"
                                style={{...styles.subheader}}
                            >
                                Newsletter
                            </h1>
                            <div
                                className="pt2 sm-center sm-px3 md-pl3 lg-pl0 thin"
                                style={{...styles.paragraph}}
                            >
                                Subscribe for updates on Ethdex development
                            </div>
                            <div className="pt1 md-pl3 lg-pl0 sm-center sm-px4">
                            </div>
                        </div>
                        <div className="sm-col sm-col-6 p4 sm-hide xs-hide">
                            <div className="center">
                                <img src="/images/paper_airplane.png" style={{width: 120}} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative" style={{backgroundColor: '#eaeaea'}}>
                    <div className="mx-auto max-width-4 pt2 relative" style={{zIndex: 2}}>
                        <h1
                            className="pt4 lg-h0 xm-center sm-center md-pl3 lg-pl0 thin"
                            style={{textTransform: 'uppercase'}}
                        >
                            The Future of Tokens
                        </h1>
                        <div
                            className="lg-pb4 md-pb4 sm-pb0 sm-center sm-px3 md-pl3 lg-pl0 thin"
                            style={{maxWidth: 750, ...styles.paragraph}}
                        >
                            <p>
                                Ethdex is a system which enables atomic exchange of Ethereum tokens. Gain instant access to fluid and liquid token swaps. 
                            </p>
                            <p>
                                As Ethereum grows, token accrual and exchange becomes an integral piece of the user lifecycle. Ethdex does not rely on any additional token to operate, we are 100% Non-rent seeking and do not require a custom token for operation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
