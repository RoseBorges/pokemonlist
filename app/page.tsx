import Content from './component/Content';
import { getTypeList } from './lib/data'

export default async function Home() {
  const typeList = await getTypeList();


  return (
    <div>
      <div className="page-header">欢迎来到宝可梦世界</div>
      <div className="p-6">
        <Content list={typeList} />
      </div>
    </div>
  );
}
