/* eslint-disable import/order */
/* eslint-disable import/first */
/* eslint-disable import/newline-after-import */

import ws from 'ws';
// @ts-expect-error
global.WebSocket = ws;

import dotenv from 'dotenv';
dotenv.config();

import './main';
