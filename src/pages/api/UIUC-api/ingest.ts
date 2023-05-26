// ingest.ts
import { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosResponse } from "axios";

import { addEdgeConfigItem } from './addCourseEdgeConfig';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { fileName, courseName } = req.query as {
      fileName: string
      courseName: string
    }

    // Make course exist in EdgeConfig
    console.log('Making course exist in EdgeConfig');

    (async () => {
      await addEdgeConfigItem(courseName)
    })();

    console.log('IT DONE ');

    
    const s3_filepath = `courses/${courseName}/${fileName}`
    
    const response: AxiosResponse = await axios.get(process.env.RAILWAY_URL + '/ingest', {
      params: {
        course_name: courseName,
        s3_paths: s3_filepath,
      },
    });
    // const data = await 
    return res.status(200).json(response.data)
    // console.log('Getting to our /ingest endpoint', data);
    // return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default handler