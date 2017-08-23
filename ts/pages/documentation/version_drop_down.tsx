import * as _ from 'lodash';
import * as React from 'react';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';

interface VersionDropDownProps {
    selectedVersion: string;
    versions: string[];
}

interface VersionDropDownState {}

export class VersionDropDown extends React.Component<VersionDropDownProps, VersionDropDownState> {
    public render() {
        return (
            <div className="mx-auto" style={{width: 120}}>
                <DropDownMenu
                    maxHeight={300}
                    value={this.props.selectedVersion}
                    onChange={this.updateSelectedVersion.bind(this)}
                >
                    {this.renderDropDownItems()}
                </DropDownMenu>
            </div>
        );
    }
    private renderDropDownItems() {
        const items = _.map(this.props.versions, version => {
            return (
                <MenuItem
                    key={version}
                    value={version}
                    primaryText={`v${version}`}
                />
            );
        });
        return items;
    }
    private updateSelectedVersion(e: any, index: number, value: string) {
        window.location.href = `/docs/0xjs/${value}${window.location.hash}`;
    }
}
