import Head from 'next/head'
import Link from 'next/link'
import { Typography, Card } from 'antd'
const { Title } = Typography
import songs from '../db/songs'

export const Home = (): JSX.Element => {
  const iroha =
    'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'

  const songsClassified = []

  for (let i = 0; i < iroha.length - 1; i++) {
    const songsFiltered: any = songs.filter((song) => song.initial === iroha[i])
    const object = {
      initial: iroha[i],
      songsFiltered,
    }

    if (object.songsFiltered.length) {
      songsClassified.push(object)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Head>
        <title>合唱コンクール.com</title>
      </Head>

      <main>
        <Card bordered={false}>
          <Typography>
            <Title>合唱コンクール</Title>
          </Typography>
          <p>合唱コンクール曲 YouTube動画リンク集</p>
        </Card>
        {songsClassified
          ? songsClassified.map((songClassified) => {
              return (
                <Card
                  title={songClassified.initial}
                  key={songClassified.initial}
                >
                  {songClassified.songsFiltered.map((song) => {
                    return (
                      <p key={song.id}>
                        <Link href={`/${song.title}`}>{song.title}</Link>
                      </p>
                    )
                  })}
                </Card>
              )
            })
          : null}
      </main>

      <footer></footer>

      <style jsx>{``}</style>
    </div>
  )
}

export default Home
