import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import songs from '../db/songs'

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
    return (
      <ul>
        {searchResults.map((result) => {
          return (
            <li key={result.id} onClick={clearSearchForm}>
              <Link href={`/${result.title}`}>{result.title}</Link>
            </li>
          )
        })}
      </ul>
    )
  }

  if (router.isFallback) {
    return <div>Loading...</div>
  } else {
    return (
      <div>
        <input type="text" value={searchText} onChange={handleInput} />
        <Suggestion />
        <h1>{song.title}</h1>
        {song.writer ? <p>作詞：{song ? song.writer : null}</p> : null}
        {song.composer ? <p>作曲：{song ? song.composer : null}</p> : null}
        {song.arranger ? <p>編曲：{song ? song.arranger : null}</p> : null}
        <MoviesYouTube movieData={movieData} />
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

const MoviesYouTube = ({ movieData }) => {
  const video =
    movieData && movieData.items
      ? movieData.items.map((video) => {
          const url = 'https://www.youtube.com/embed/' + video.id.videoId

          return (
            <li key={video.id.videoId}>
              <div style={{ margin: '20px', textAlign: 'center' }}>
                <iframe
                  id="ytplayer"
                  width="480"
                  height="270"
                  src={url}
                  frameBorder="0"
                />
              </div>
            </li>
          )
        })
      : null

  return <div style={{ marginTop: '10px' }}>{video}</div>
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
