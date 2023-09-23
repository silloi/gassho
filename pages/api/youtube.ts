import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv';

type ResponseDataItem = {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
};

type ResponseData = {
  kind: string;
  etag: string;
  nextPageToken: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: ResponseDataItem[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseDataItem[] | { message: string }>
) {
  if (!req.query.title || !req.query.id) {
    return res.status(400).json({ message: 'Bad Request' });
  }

  /** check whether cached data exist */
  const cachedData: ResponseDataItem[] = await kv.hget(`song-${req.query.id}`, 'items');
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  const endpoint = 'https://www.googleapis.com/youtube/v3/search'
  const part = 'id'
  const q = `${req.query.title}合唱曲`
  const maxResults = 3
  const regionCode = 'jp'

  const key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

  const query = encodeURI(
    `part=${part}&q=${q}&maxResults=${maxResults}&regionCode=${regionCode}&key=${key}`
  );
  const response = await fetch(`${endpoint}?${query}`);
  if (response.status !== 200) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }

  const data: ResponseData = await response.json();

  /** cache response data */
  await kv.hset(`song-${req.query.id}`, data);

  res.status(200).json(data.items);
}
