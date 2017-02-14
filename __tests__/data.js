import fs from 'fs';
import XmlParser from 'x2js';

const parser = new XmlParser({ attributePrefix: '' });

export const containerXml = parser.xml2js(fs.readFileSync(`${__dirname}/container.xml`, 'utf-8'));
export const contentOpf = parser.xml2js(fs.readFileSync(`${__dirname}/content.opf`, 'utf-8'));
export const testSmil = parser.xml2js(fs.readFileSync(`${__dirname}/test.smil`, 'utf-8'))
export const tocHtml = parser.xml2js(fs.readFileSync(`${__dirname}/toc.xhtml`, 'utf-8'));
