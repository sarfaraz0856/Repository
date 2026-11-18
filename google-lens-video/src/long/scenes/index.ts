import React from 'react';
import * as intro from './intro';
import * as what from './what';
import * as scan from './scan';
import * as ai from './ai';
import * as results from './results';
import * as text from './text';
import * as uses from './uses';
import * as howto from './howto';
import * as outro from './outro';

type SceneMod = {Screen: React.FC<{f: number}>; Side: React.FC<{f: number}>};
export const SCENE_COMPONENTS: Record<string, SceneMod> = {intro, what, scan, ai, results, text, uses, howto, outro};
