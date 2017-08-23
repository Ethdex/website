import * as _ from 'lodash';
import * as React from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import {colors} from 'material-ui/styles';
import ReactTooltip = require('react-tooltip');
import {configs} from 'ts/utils/configs';
import {constants} from 'ts/utils/constants';
import {Identicon} from 'ts/components/ui/identicon';
import {OTCMenu} from 'ts/components/otc_menu';
import {Docs0xjsMenu} from 'ts/pages/documentation/docs_0xjs_menu';
import {Styles, TypeDocNode, MenuSubsectionsBySection} from 'ts/types';
import {
    Link as ScrollLink,
    animateScroll,
} from 'react-scroll';
import {Link} from 'react-router-dom';
import {HashLink} from 'react-router-hash-link';

const SECTION_HEADER_COLOR = 'rgb(234, 234, 234)';

interface TopBarProps {
    userAddress?: string;
    blockchainIsLoaded: boolean;
    location: Location;
    zeroExJSversion?: string;
    availableZeroExJSVersions?: string[];
    menuSubsectionsBySection?: MenuSubsectionsBySection;
    shouldFullWidth?: boolean;
}

interface TopBarState {
    isDrawerOpen: boolean;
}

const styles: Styles = {
    address: {
        marginRight: 12,
        overflow: 'hidden',
        paddingTop: 4,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: 70,
    },
    addressPopover: {
        backgroundColor: colors.blueGrey500,
        color: 'white',
        padding: 3,
    },
    topBar: {
        backgroundColor: 'white',
        height: 42,
        width: '100%',
        position: 'fixed',
        top: 0,
        zIndex: 1100,
        paddingBottom: 1,
        boxShadow: 'rgba(0, 0, 0, 0.187647) 0px 1px 3px',
    },
};

export class TopBar extends React.Component<TopBarProps, TopBarState> {
    public static defaultProps: Partial<TopBarProps> = {
        shouldFullWidth: false,
    };
    constructor(props: TopBarProps) {
        super(props);
        this.state = {
            isDrawerOpen: false,
        };
    }
    public render() {
        const parentClassNames = `flex mx-auto ${this.props.shouldFullWidth ? 'pl2' : 'max-width-4'}`;
        return (
            <div style={styles.topBar} className="pb1">
                <div className={parentClassNames}>
                    <div className="col col-1">
                        <div
                            className="sm-pl2 md-pl2 lg-pl0"
                            style={{fontSize: 25, color: 'black', cursor: 'pointer', paddingTop: 8}}
                        >
                            <i
                                className="zmdi zmdi-menu"
                                onClick={this.onMenuButtonClick.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="col col-8" />
                    <div className="col col-3">
                        {this.renderUser()}
                    </div>
                </div>
                {this.renderDrawer()}
            </div>
        );
    }
    private renderDrawer() {
        return (
            <Drawer
                open={this.state.isDrawerOpen}
                docked={false}
                onRequestChange={this.onMenuButtonClick.bind(this)}
            >
                {this.renderOTCMenu()}
                {this.render0xjsDocMenu()}
                <div className="pl1 py1 mt3" style={{backgroundColor: SECTION_HEADER_COLOR}}>Website</div>
                {this.renderHomepageMenuItem('home')}
                <a
                    className="text-decoration-none"
                    target="_blank"
                    href="/white_paper.pdf"
                >
                    <MenuItem className="py2">Whitepaper</MenuItem>
                </a>
                {!this.isViewingOTC() &&
                    <Link to="/otc" className="text-decoration-none">
                        <MenuItem className="py2">OTC</MenuItem>
                    </Link>
                }
            </Drawer>
        );
    }
    private render0xjsDocMenu() {
        if (!this.isViewing0xjsDocs()) {
            return;
        }

        return (
            <div className="lg-hide md-hide">
                <div className="pl1 py1" style={{backgroundColor: SECTION_HEADER_COLOR}}>0x.js Docs</div>
                <Docs0xjsMenu
                    menuSubsectionsBySection={this.props.menuSubsectionsBySection}
                    shouldDisplaySectionHeaders={false}
                    onMenuItemClick={this.onMenuButtonClick.bind(this)}
                    selectedVersion={this.props.zeroExJSversion}
                    versions={this.props.availableZeroExJSVersions}
                />
            </div>
        );
    }
    private renderOTCMenu() {
        if (!this.isViewingOTC()) {
            return;
        }

        return (
            <div className="lg-hide md-hide">
                <div className="pl1 py1" style={{backgroundColor: SECTION_HEADER_COLOR}}>OTC DApp</div>
                <OTCMenu
                    menuItemStyle={{color: 'black'}}
                    onClick={this.onMenuButtonClick.bind(this)}
                />
            </div>
        );
    }
    private renderHomepageMenuItem(location: string) {
        if (this.props.location.pathname === '/') {
            return (
                <ScrollLink
                    to={location}
                    smooth={true}
                    offset={0}
                    duration={constants.HOME_SCROLL_DURATION_MS}
                >
                    <MenuItem
                        className="py2"
                        onTouchTap={this.onMenuButtonClick.bind(this)}
                    >
                        {_.capitalize(location)}
                    </MenuItem>
                </ScrollLink>
            );
        } else {
            return (
                <HashLink to={`/#${location}`} className="text-decoration-none">
                    <MenuItem
                        className="py2"
                        onTouchTap={this.onMenuButtonClick.bind(this)}
                    >
                        {_.capitalize(location)}
                    </MenuItem>
                </HashLink>
            );
        }
    }
    private renderUser() {
        if (!this.props.blockchainIsLoaded || this.props.userAddress === '') {
            return <span />;
        }

        const userAddress = this.props.userAddress;
        const identiconDiameter = 26;
        return (
            <div className="flex right pt1 lg-pr0 md-pr2 sm-pr2">
                <div
                    style={styles.address}
                    data-tip={true}
                    data-for="userAddressTooltip"
                >
                    {!_.isEmpty(userAddress) ? userAddress : ''}
                </div>
                <ReactTooltip id="userAddressTooltip">{userAddress}</ReactTooltip>
                <div>
                    <Identicon address={userAddress} diameter={identiconDiameter} />
                </div>
            </div>
        );
    }
    private onMenuButtonClick() {
        this.setState({
            isDrawerOpen: !this.state.isDrawerOpen,
        });
    }
    private isViewingOTC() {
        return _.includes(this.props.location.pathname, '/otc');
    }
    private isViewing0xjsDocs() {
        return _.includes(this.props.location.pathname, '/docs/0xjs');
    }
}
