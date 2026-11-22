import React from 'react';
import * as s2 from './s2';
import * as s3 from './s3';
import * as s4 from './s4';
import * as s5 from './s5';
import * as s6 from './s6';
import * as s7 from './s7';
import * as s8 from './s8';
import * as s9 from './s9';
import * as s10 from './s10';
import * as s11 from './s11';

type M = {Screen: React.FC<{f: number}>; Stage: React.FC<{f: number}>};
export const SCENES: Record<string, M> = {s2, s3, s4, s5, s6, s7, s8, s9, s10, s11};
