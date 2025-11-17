import useTaskStatus from "../../hooks/useTaskStatus"

function TaskStatus() {
    const {statusList} = useTaskStatus()
  return (
    <div>
        {statusList.map((status, index) => (
            <div key={index}>{status.title}</div>
        ))}
    </div>
  )
}

export default TaskStatus