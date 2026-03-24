const axios = require('axios');
axios.get("https://hire-filter-backend.onrender.com/api/jobs").then(r => {
   const jobs = r.data.data || r.data.jobs;
   if(jobs && jobs.length > 0) {
       require('fs').writeFileSync('job_fields.json', JSON.stringify(Object.keys(jobs[0]), null, 2));
   } else {
       console.log('No jobs found in db');
   }
}).catch(e => console.error(e.message));
