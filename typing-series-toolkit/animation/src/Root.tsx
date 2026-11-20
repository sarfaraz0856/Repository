import React from 'react';
import {Composition} from 'remotion';
import {Part3Scene} from './p3';
import P3T from './p3timing.json';

const S = (s: number) => Math.round(s * 30);
export const Root: React.FC = () => (
	<Composition id="Part3" component={Part3Scene} durationInFrames={S(P3T.total)} fps={30} width={1920} height={1080} />
);
