import * as React from 'react';
import {colors} from 'material-ui/styles';

export interface InputLabelProps {
    text: string | Element | React.ReactNode;
}

const styles = {
    label: {
        color: colors.grey500,
        fontSize: 12,
        pointerEvents: 'none',
        textAlign: 'left',
        transformOrigin: 'left top 0px',
        userSelect: 'none',
        width: 240,
        zIndex: 1,
    },
};

export const InputLabel = (props: InputLabelProps) => {
    return (
        <label style={styles.label}>{props.text}</label>
    );
};
