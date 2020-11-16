import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Typography, List, Input, Row, Col } from 'antd'
const { Title } = Typography
import songs from '../db/songs'
import 'antd/dist/antd.css'

export const Song = ({ song, movieData }) => {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')

  const handleInput = (e) => {
    const { value } = e.target
    setSearchText(value)
  }

  const clearSearchForm = () => {
    setSearchText('')
  }

  const searchResults = useMemo(() => {
    if (!searchText) {
      return []
    }

    return songs.filter((song) => song.title.startsWith(searchText))
  }, [searchText])

  const Suggestion = () => {
    return searchResults.length ? (
      <List
        bordered
        size="small"
        dataSource={searchResults}
        style={{ position: 'fixed', backgroundColor: 'white', width: '100%' }}
        renderItem={(result) => (
          <List.Item onClick={clearSearchForm}>
            <Link href={`/${result.title}`}>{result.title}</Link>
          </List.Item>
        )}
      />
    ) : null
  }

  if (router.isFallback) {
    return <div>Loading...</div>
  } else {
    return (
      <div>
        <div style={{ position: 'fixed', width: '100%', zIndex: 10 }}>
          <Input
            placeholder="タイトルを検索"
            value={searchText}
            onChange={handleInput}
          />
          <Suggestion />
        </div>
        <div style={{ paddingTop: 60 }}>
          <Typography>
            <Title>{song.title}</Title>
          </Typography>
          {song.writer ? <p>作詞：{song.writer}</p> : null}
          {song.composer ? <p>作曲：{song.composer}</p> : null}
          {song.arranger ? <p>編曲：{song.arranger}</p> : null}
          <a href={`https://ja.wikipedia.org/wiki/${song.title}`}>
            Wikipediaで調べる
          </a>
          <MoviesYouTube movieData={movieData} title={song.title} />
        </div>
      </div>
    )
  }
}

export const fetchYouTube = async (title: string | string[]) => {
  const endpoint = 'https://www.googleapis.com/youtube/v3/search'
  const part = 'id'
  const q = `${title}|合唱曲`
  const maxResults = 3
  const regionCode = 'jp'

  const key = process.env.YOUTUBE_API_KEY

  const query = encodeURI(
    `part=${part}&q=${q}&maxResults=${maxResults}&regionCode=${regionCode}&key=${key}`
  )
  const response = await fetch(`${endpoint}?${query}`)
  const data = await response.json()

  return data
}

const MoviesYouTube = ({ movieData, title }) => {
  const videos =
    movieData && movieData.items
      ? movieData.items.map((video) => {
          const url = 'https://www.youtube.com/embed/' + video.id.videoId

          return (
            <Col key={video.id.videoId} span={24}>
              <div className="video_container">
                <iframe
                  id="ytplayer"
                  width="320"
                  height="180"
                  src={url}
                  frameBorder="0"
                />
              </div>
            </Col>
          )
        })
      : null

  return (
    <div>
      <Row>{videos}</Row>
      <a href={`https://www.youtube.com/results?search_query=${title}+合唱`}>
        YouTubeでもっと調べる
      </a>
      <style jsx>{`
        .video_container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
        }
        .video_container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  /* タイトルの一覧を返す
   * (`[title]` をファイル名に使用しているため。でないと `getStaticPaths` がこける)
   */
  const paths = songs.map((song) => ({ params: { title: song.title } }))
  // 事前ビルドしたいパスをpathsとして渡す fallbackについては後述
  return { paths, fallback: true }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  /*
   * タイトルに紐づく、ページの生成に必要なデータを返す
   * 引数の `params` の中に `title` が入ってる
   * (この page は `/{title}` というパスでアクセスされる)
   */
  const song = songs.find((song) => song.title === params.title)

  const movieData = await fetchYouTube(params.title)

  return {
    props: {
      // `props` key の inside で結果を返す
      song,
      movieData,
    },
  }
}

export default Song
