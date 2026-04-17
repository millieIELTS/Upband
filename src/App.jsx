import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Writing from './pages/Writing'
import WritingTask from './pages/WritingTask'
import Speaking from './pages/Speaking'
import SpeakingPart1Select from './pages/SpeakingPart1Select'
import SpeakingPart1 from './pages/SpeakingPart1'
import SpeakingPart2Select from './pages/SpeakingPart2Select'
import SpeakingPart2 from './pages/SpeakingPart2'
import SpeakingPart3Select from './pages/SpeakingPart3Select'
import SpeakingPart3 from './pages/SpeakingPart3'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import WritingHomework from './pages/WritingHomework'
import WritingHomeworkSelect from './pages/WritingHomeworkSelect'
import MyPage from './pages/MyPage'
import Settings from './pages/Settings'
import SubmissionDetail from './pages/SubmissionDetail'
import Store from './pages/Store'
import AdminEbooks from './pages/AdminEbooks'
import WritingSubmissions from './pages/WritingSubmissions'
import VocabSelect from './pages/VocabSelect'
import VocabStudy from './pages/VocabStudy'
import Community from './pages/Community'
import CommunityBoard from './pages/CommunityBoard'
import CommunityWrite from './pages/CommunityWrite'
import CommunityPost from './pages/CommunityPost'
import MockTest from './pages/MockTest'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Refund from './pages/Refund'
import CreditHistory from './pages/CreditHistory'
import RequireAuth from './components/RequireAuth'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/writing" element={<RequireAuth><Writing /></RequireAuth>} />
          <Route path="/writing/:taskType" element={<RequireAuth><WritingTask /></RequireAuth>} />
          <Route path="/writing/homework" element={<RequireAuth><WritingHomeworkSelect /></RequireAuth>} />
          <Route path="/writing/homework/:taskType" element={<RequireAuth><WritingHomework /></RequireAuth>} />
          <Route path="/speaking" element={<RequireAuth><Speaking /></RequireAuth>} />
          <Route path="/speaking/part1" element={<RequireAuth><SpeakingPart1Select /></RequireAuth>} />
          <Route path="/speaking/part1/:topicId" element={<RequireAuth><SpeakingPart1 /></RequireAuth>} />
          <Route path="/speaking/part2" element={<RequireAuth><SpeakingPart2Select /></RequireAuth>} />
          <Route path="/speaking/part2/:topicId" element={<RequireAuth><SpeakingPart2 /></RequireAuth>} />
          <Route path="/speaking/part3" element={<RequireAuth><SpeakingPart3Select /></RequireAuth>} />
          <Route path="/speaking/part3/:topicId" element={<RequireAuth><SpeakingPart3 /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
          <Route path="/history/writing" element={<RequireAuth><WritingSubmissions /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dashboard/submissions" element={<RequireAuth><SubmissionDetail /></RequireAuth>} />
          <Route path="/dashboard/ebooks" element={<RequireAuth><AdminEbooks /></RequireAuth>} />
          <Route path="/vocab" element={<RequireAuth><VocabSelect /></RequireAuth>} />
          <Route path="/vocab/:bandId" element={<RequireAuth><VocabSelect /></RequireAuth>} />
          <Route path="/vocab/:bandId/:topicId" element={<RequireAuth><VocabStudy /></RequireAuth>} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:categoryId" element={<CommunityBoard />} />
          <Route path="/community/:categoryId/write" element={<RequireAuth><CommunityWrite /></RequireAuth>} />
          <Route path="/community/:categoryId/edit/:postId" element={<RequireAuth><CommunityWrite /></RequireAuth>} />
          <Route path="/community/:categoryId/:postId" element={<CommunityPost />} />
          <Route path="/mock-test" element={<MockTest />} />
          <Route path="/store" element={<Store />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/mypage/credits" element={<RequireAuth><CreditHistory /></RequireAuth>} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
