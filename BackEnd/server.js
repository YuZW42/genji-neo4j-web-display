const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');
const serializeJavascript = require('serialize-javascript');
const app = express();

require('dotenv').config();

app.use(cors());

const driver = neo4j.driver(
    process.env.REACT_APP_NEO4J_URI,
    neo4j.auth.basic(process.env.REACT_APP_NEO4J_USERNAME, process.env.REACT_APP_NEO4J_PASSWORD)
);




app.get("/api", (req,res) =>{
  res.json({"users":["user"]})

})


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
      
      
      
      res.json(result);
  } catch (error) {
      console.error('Failed to execute queries:', error);
      res.status(500).json({ error: 'Failed to execute queries' });
  } finally {
      await session.close();
  }
});

app.listen(8000,()=> {console.log("Server started on port 8000")})