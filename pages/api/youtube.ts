import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  kind: string;
  etag: string;
  nextPageToken: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: {
    kind: string;
    etag: string;
    id: {
      kind: string;
      videoId: string;
    };
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { message: string }>
) {
  if (!req.query.title || !req.query.id) {
    res.status(400).json({ message: 'Bad Request' });
  }

  const endpoint = 'https://www.googleapis.com/youtube/v3/search'
  const part = 'id'
  const q = `${req.query.title}合唱曲`
  const maxResults = 3
  const regionCode = 'jp'

  const key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

  const query = encodeURI(
    `part=${part}&q=${q}&maxResults=${maxResults}&regionCode=${regionCode}&key=${key}`
  )
  const response = await fetch(`${endpoint}?${query}`);
  const data = await response.json();

  res.status(200).json(data)
}
