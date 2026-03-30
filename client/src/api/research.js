import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL


export async function fetchResearch(companies) {
  const res = await axios.post(`${API_URL}/api/research`, {
    companies
  })
  return res.data.rawData
}