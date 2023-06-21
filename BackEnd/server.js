const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');
const isInt = neo4j.isInt;
const isDate = neo4j.isDate;
const isDateTime = neo4j.isDateTime;
const isTime = neo4j.isTime;
const isLocalDateTime = neo4j.isLocalDateTime;
const isLocalTime = neo4j.isLocalTime;
const isDuration = neo4j.isDuration;

const traj = require ('./traj.js');

const app = express();

require('dotenv').config();

app.use(cors());

const driver = neo4j.driver(
    process.env.REACT_APP_NEO4J_URI,
    neo4j.auth.basic(process.env.REACT_APP_NEO4J_USERNAME, process.env.REACT_APP_NEO4J_PASSWORD)
);
function toNativeTypes(properties) {
  return Object.fromEntries(Object.keys(properties).map((key) => {
      let value = valueToNativeType(properties[key])

      return [ key, value ]
  }))
}
function valueToNativeType(value) {
  if ( Array.isArray(value) ) {
      value = value.map(innerValue => valueToNativeType(innerValue))
  }
  else if ( isInt(value) ) {
      value = value.toNumber()
  }
  else if (
      isDate(value) ||
      isDateTime(value) ||
      isTime(value) ||
      isLocalDateTime(value) ||
      isLocalTime(value) ||
      isDuration(value)
  ) {
      value = value.toString()
  }
  else if (typeof value === 'object' && value !== undefined  && value !== null) {
      value = toNativeTypes(value)
  }

  return value
}

function concatObj(e) {
  return Object.values(e).join('')
}

//character
function generateGeneology(l) {
  let counts = l.reduce((acc, subArr) => {
      subArr.forEach(str => {
              if (!str.includes('_')){
                  if (!acc[str]) {
                      acc[str] = 1;
                  } else {
                      acc[str]++;
              }}});
      return acc;
  }, {});
  delete counts.Genji
  let ranked = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(pair => pair[0]);
  let nodes = [{
      id: '1',
      data: {
          label: 'Genji'
      }, 
      position: {x: traj[0][0], y: traj[0][0]}
  }]
  let edges = []
  let id = 2
  ranked.forEach(e => {
      nodes.push({
          id: id.toString(),
          data: {
              label: e
          },
          position: {x : traj[1750-id*2][0], y: traj[1750-id*2][1]},
          draggable: true,
      })
      id += 1
  })
  id = 1
  l.forEach(e => {
      let s = nodes.findIndex(element => element.data.label === e[0])
      let t = nodes.findIndex(element => element.data.label === e[2])
      s = (s+1).toString()
      t = (t+1).toString()
      edges.push({
          id: 'e'+id.toString(),
          source: s,
          target: t,
          label: e[1]
      })
      id += 1
  })
  return [nodes, edges]
}

app.get('/getAllData', async (req, res) => {
  
  const session = driver.session();
  const { chapter, number } = req.query;
  
  console.log('chapter',chapter, " + ", number)
  
  const queries = {
      res: 'match poem=(g:Genji_Poem)-[:INCLUDED_IN]->(:Chapter {chapter_number: "' + chapter + '"}), exchange=(s:Character)-[:SPEAKER_OF]->(g)<-[:ADDRESSEE_OF]-(a:Character), trans=(g)-[:TRANSLATION_OF]-(:Translation)-[:TRANSLATOR_OF]-(:People) where g.pnum ends with "' + number + '" return poem, exchange, trans',
      resHonkaInfo:  'match (g:Genji_Poem)-[:INCLUDED_IN]->(:Chapter {chapter_number: "' + chapter + '"}), (g)-[n:ALLUDES_TO]->(h:Honka)-[r:ANTHOLOGIZED_IN]-(s:Source), (h)<-[:AUTHOR_OF]-(a:People), (h)<-[:TRANSLATION_OF]-(t:Translation)<-[:TRANSLATOR_OF]-(p:People) where g.pnum ends with "' + number + '" return h.Honka as honka, h.Romaji as romaji, s.title as title, a.name as poet, r.order as order, p.name as translator, t.translation as translation, n.notes as notes',
      resRel : 'match (g:Genji_Poem)-[:INCLUDED_IN]->(:Chapter {chapter_number: "' + chapter + '"}), (g)-[:INTERNAL_ALLUSION_TO]->(s:Genji_Poem) where g.pnum ends with "' + number + '" return s.pnum as rel',
      resPnum : 'match (g:Genji_Poem) return g.pnum as pnum',
      resTag : 'match (g:Genji_Poem)-[:INCLUDED_IN]->(:Chapter {chapter_number: "' + chapter + '"}), (g)-[:TAGGED_AS]->(t:Tag) where g.pnum ends with "' + number + '" return t.Type as type',
      resType : 'match (t:Tag) return t.Type as type'
  };

  const result = {};

  try {
      for (let key in queries) {
          const queryResult = await session.readTransaction(tx => 
            tx.run(queries[key], { chapter, number})
            ); 
          /*tx.run(queries[key], { chapter, number })*/ 
          result[key] = queryResult;
          
          
          
      }
      //for exchange
      let exchange = new Set()           
      result['res'].records.map(e => JSON.stringify(toNativeTypes(e.get('exchange')))).forEach(e => exchange.add(e))
      exchange = Array.from(exchange).map(e => JSON.parse(e))
      
      //for transtemp
      let transTemp = result['res'].records.map(e => toNativeTypes(e.get('trans'))).map(e => [e.end.properties.name, e.segments[0].end.properties.translation, e.segments[1].start.properties.WaleyPageNum])
      let sources = result['resHonkaInfo'].records.map(e => [Object.values(toNativeTypes(e.get('honka'))).join(''), Object.values(toNativeTypes(e.get('title'))).join(''), Object.values(toNativeTypes(e.get('romaji'))).join(''), Object.values(toNativeTypes(e.get('poet'))).join(''), Object.values(toNativeTypes(e.get('order'))).join(''), Object.values(toNativeTypes(e.get('translator'))).join(''), Object.values(toNativeTypes(e.get('translation'))).join(''), e.get('notes') !== null ? Object.values(toNativeTypes(e.get('notes'))).join('') : 'N/A'])
      //related
      let related = new Set()
      result['resRel'].records.map(e => toNativeTypes(e.get('rel'))).forEach(e => related.add([Object.values(e).join('')]))
      related = Array.from(related).flat()
      related = related.map(e => [e, true])
      //res tag
      let tags = new Set()
      result['resTag'].records.map(e => toNativeTypes(e.get('type'))).forEach(e => tags.add([Object.values(e).join('')]))
      tags = Array.from(tags).flat()
      tags = tags.map(e => [e, true])
      //types
      let types = result['resType'].records.map(e => e.get('type'))
      //ls
      let ls = []
      types.forEach(e => ls.push({value: e, label: e})) 
      //pls
      let temp = result['resPnum'].records.map(e => e.get('pnum'))
      let pls = []
      temp.forEach(e => {
          pls.push({value:e, label:e})
      })
      console.log('exchange',exchange)
      console.log('related', result['resRel'])
      const data = [exchange, transTemp, sources, related, tags, ls, pls];
      res.json(data);
      //res.json (exchange)
      //res.json(exchange,transTemp,sources,related,tags,ls,pls);
  } catch (error) {
      console.error('Failed to execute queries:', error);
      res.status(500).json({ error: 'Failed to execute queries' });
  } finally {
      await session.close();
  }
});


app.get('/tagQueries', async (req, res) => {
  const session = driver.session();
  const query = req.query;
  let write =  await session.writeTransaction(tx => tx.run(query));
  res.json(write);
})


/*
    Characters Page
*/
app.get('/characterGraph', async (req, res) => {
  
  const session = driver.session();
  let resGraph = await session.readTransaction(tx => tx.run('MATCH (a:Character)-[r]-(b:Character) return a.name as startName, TYPE(r) as rel, b.name as endName')) 
  resGraph = resGraph.records.map(e => [concatObj(toNativeTypes(e.get('startName'))), concatObj(toNativeTypes(e.get('rel'))), concatObj(toNativeTypes(e.get('endName')))])
  console.log(generateGeneology(resGraph))

  res.json(generateGeneology(resGraph));
})


app.listen(8000,()=> {console.log("Server started on port 8000")})