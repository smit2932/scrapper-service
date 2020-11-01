const expect = require('chai').expect
const assert = require('chai').assert

// import math file
const { scrappingFunction, refreshDetails } = require('../services/fetchDetailsService')

it('Main scrap content', async function () {
  const res = await scrappingFunction('https://www.amazon.in/dp/B078HRR1XV/ref=s9_acsd_al_bw_c2_x_2_i?pf_rd_m=A1K21FY43GMZF8&pf_rd_s=merchandised-search-13&pf_rd_r=05VRFFKQFB9W57KJHXPC&pf_rd_t=101&pf_rd_p=372d57f5-cb00-4083-897b-bfe454eaea36&pf_rd_i=976392031p')
  expect(res).to.have.property('title')
  expect(res).to.have.property('price')
  expect(res).to.have.property('images')
  expect(res).to.have.property('description')
})
