import { useRouter } from 'next/router'

const Song = () => {
  const router = useRouter()
  const { title } = router.query

  return <p>{title}</p>
}

export default Song