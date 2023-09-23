import Head from 'next/head'
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Typography, List, Input, Card, Row, Col } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
const { Title } = Typography
import songs from '../db/songs'

export const Song = ({ song }) => {
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
        style={{ backgroundColor: 'white', width: '100%' }}
        renderItem={(result) => (
          <List.Item onClick={clearSearchForm}>
            <Link href={`/${result.title}`}>{result.title}</Link>
          </List.Item>
        )}
      />
    ) : null
  }

  const [movieItems, setMovieItems] = useState([])

  const fetchYouTube = async () => {
    if (!song) {
      return
    }

    const response = await fetch(`/api/youtube?id=${song.id}&title=${song.title}`)
    const items = await response.json()

    setMovieItems(items)
  }

  useEffect(() => {
    fetchYouTube()
  }, [song])

  if (router.isFallback) {
    return <div>Loading...</div>
  } else {
    return (
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <Head>
          <title>{`${song.title} | 合唱コンクール.com`}</title>
        </Head>

        <div
          style={{
            position: 'fixed',
            width: '100%',
            backgroundColor: '#fff',
            zIndex: 10,
            top: 0,
          }}
        >
          <div style={{ maxWidth: 800 }}>
            <PageHeader
              onBack={() => window.history.back()}
              title={
                <Link href="/">合唱コンクール曲一覧</Link>
              }
            />
            <Input
              placeholder="タイトルを検索"
              value={searchText}
              onChange={handleInput}
            />
            <Suggestion />
          </div>
        </div>
        <main style={{ paddingTop: 120 }}>
          <Card bordered={false}>
            <Typography>
              <Title>{song.title}</Title>
            </Typography>
            {song.writer ? <p>作詞：{song.writer}</p> : null}
            {song.composer ? <p>作曲：{song.composer}</p> : null}
            {song.arranger ? <p>編曲：{song.arranger}</p> : null}
            <a href={`https://ja.wikipedia.org/wiki/${song.title}`}>
              Wikipediaで調べる
            </a>
          </Card>
          <MoviesYouTube movieItems={movieItems} title={song.title} />
        </main>
        <style jsx>{``}</style>
      </div>
    )
  }
}

const MoviesYouTube = ({ movieItems, title }) => {
  const videos =
    movieItems
      ? movieItems.map((video) => {
          const url = 'https://www.youtube.com/embed/' + video.id.videoId

          return (
            <Col key={video.id.videoId} span={24}>
              <div className="video_container">
                <iframe
                  id="ytplayer"
                  width="375"
                  height="211"
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
      <Card bordered={false}>
        <a href={`https://www.youtube.com/results?search_query=${title}+合唱`}>
          YouTubeでもっと調べる
        </a>
      </Card>
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

  return {
    props: {
      // `props` key の inside で結果を返す
      song,
    },
  }
}

export default Song
