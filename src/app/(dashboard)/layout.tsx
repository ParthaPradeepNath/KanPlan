import { CreateTaskModal } from '@/features/tasks/components/create-task-modal'
import { CreateWorkspaceModal } from '@/features/workspaces/components/create-workspace-modal'
import { CreateProjectModal } from '@/features/projects/components/create-project-modal'
import { EditTaskModal } from '@/features/tasks/components/edit-task-modal'

import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen">
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <EditTaskModal />
      <div className="flex h-full w-full">
        <div className="fixed top-0 left-0 hidden h-full overflow-y-auto lg:block lg:w-[264px]">
          <Sidebar />
        </div>
        <div className="w-full lg:pl-[264px]">
          <div className="mx-auto h-full max-w-screen-2xl">
            <Navbar />
            <main className="flx h-full flex-col px-6 py-8">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
