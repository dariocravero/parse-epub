import fs from 'fs';
import XmlParser from 'x2js';

const parser = new XmlParser({ attributePrefix: '' });

export const containerXml = parser.xml2js(fs.readFileSync(`${__dirname}/container.xml`, 'utf-8'));
export const contentOpf = parser.xml2js(fs.readFileSync(`${__dirname}/content.opf`, 'utf-8'));
export const fixedLayoutOpf = parser.xml2js(fs.readFileSync(`${__dirname}/fixed-layout.opf`, 'utf-8'));
export const nestedTocHtml = parser.xml2js(fs.readFileSync(`${__dirname}/nested-toc.xhtml`, 'utf-8'));
export const testSmil = parser.xml2js(fs.readFileSync(`${__dirname}/test.smil`, 'utf-8'))
export const tocHtml = parser.xml2js(fs.readFileSync(`${__dirname}/toc.xhtml`, 'utf-8'));
export const entireHiddenTocHtml = parser.xml2js(fs.readFileSync(`${__dirname}/entire-hidden-toc.xhtml`, 'utf-8'));
export const hiddenSectionTocHtml = parser.xml2js(fs.readFileSync(`${__dirname}/hidden-section-toc.xhtml`, 'utf-8'));
export const hiddenItemTocHtml = parser.xml2js(fs.readFileSync(`${__dirname}/hidden-item-toc.xhtml`, 'utf-8'));
export const hiddenSingleItemTocHtml = parser.xml2js(fs.readFileSync(`${__dirname}/hidden-single-item-toc.xhtml`, 'utf-8'));
export const tocWithPageList = parser.xml2js(fs.readFileSync(`${__dirname}/toc-with-page-list.xhtml`, 'utf-8'));
