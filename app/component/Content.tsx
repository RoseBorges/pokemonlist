'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { getPokeListByType, getPokemonInfo, geInitList } from '../lib/data'
import PokemonBox from './PokemonBox';

const PAGE_SIZE = 24;
export default function Content({
    list,
}: {
    list: any,
  }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [select, setSelect] = useState('');
    // type对应的精灵列表
    const [resObj, setResObj] = useState<any>({});
    // 精灵信息表
    const [infoObj, setInfoObj] = useState<any>({});
    // 筛选之后的总列表
    const [showList,setShowList] = useState<string[]>([]);
    // 翻页
    const [page, setPage] = useState(1);

    // click type nav
    const onTriggerItem = (item: {name:string, url:string}) => {
      const { name, url } = item;

      let newList:Array<string> = select ? select.split(',') : [];
      if (select.indexOf(name) !== -1) {
        newList = newList.filter((s:string) => s !== name);
      } else {
        newList.push(name);
      }
      setSelect(newList.join(','));
      getResByType(name, newList);
      if (newList.length === 0) {
        initNotypeList();
      }
    }

    // 页面url搜索参数修改
    const setUrlSearch = (newList: string[], page: number) => {
      const params = new URLSearchParams(searchParams);
      if (newList.length) {
        params.set('type', newList.join(','));
      } else {
        params.delete('type');
      }
      params.set('page', page.toString());
      router.push(`/?${params.toString()}`, { shallow: true });
    }

    // 通过筛选项，【两两组合】求交集
    const getFilterList = async (newList: Array<any>, urlPage = 1) => {
      let newResObj = resObj;
      let newShowList: string[] = [];
      if (newList.length === 1) {
        newShowList = newResObj[newList[0]];
      } else {
        // 列表【两两组合】求交集
        for (let i = 0; i < newList.length; i++) {
          for (let j = i + 1; j < newList.length; j++) {
            const originList = newResObj[newList[i]];
            const targetList = newResObj[newList[j]];
            originList.forEach((itemName: string) => {
              if (targetList.indexOf(itemName) !== -1) {
                newShowList.push(itemName)
              }
            })
          }
        }
      }
      setPage(urlPage);
      setUrlSearch(newList, urlPage);
      await getAllPokemonInfo(newShowList, urlPage);
      setShowList(newShowList);
    }

    // 点击事件之后：1.更新type的map表，2.更新列表
    const getResByType = async (name: string, newList: Array<any>) => {
      let newResObj = resObj;
      if (!newResObj[name]) {
        const list = await getPokeListByType(name);
        newResObj[name] = list.map((item: any) => (item.pokemon.name))
      }
      setResObj(newResObj);
      getFilterList(newList);
    }

    // 通过名称获取单个精灵信息，只获取当前页的
    const getAllPokemonInfo = async (showList: string[], page: number) => {
      const currentPageList = showList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      const setPageList = currentPageList.filter(cp => !infoObj[cp]);
      setLoading(true);
      const res =  await Promise.all(setPageList.map((paramName: string) => getPokemonInfo(paramName)));
      setLoading(false);
      res.forEach((item: any) => {
        infoObj[item.name] = item;
      })
    }

    // 翻页
    const onPreviousPage = async () => {
      if (page === 1) return;
      const nextPage = page - 1;
      await getAllPokemonInfo(showList, nextPage);
      setPage(nextPage);
      setUrlSearch(select.split(','), nextPage);
    }
    const onNextPage = async () => {
      const nextPage = page + 1;
      await getAllPokemonInfo(showList, nextPage);
      setPage(nextPage);
      setUrlSearch(select.split(','), nextPage);
    }

    // 设置type的map表
    const getObjMapByType = async (name: string) => {
      let newResObj = resObj;
      if (!newResObj[name]) {
        const list = await getPokeListByType(name);
        newResObj[name] = list.map((item: any) => (item.pokemon.name))
      }
      setResObj(newResObj);
    }

    // 进入页面, url上有type参数时初始化数据
    const setInitData = (urlType: string[], urlPage: number) => {
      Promise.all(urlType.map(t => getObjMapByType(t))).then(res => {
        getFilterList(urlType, urlPage);
      });
    }

    // 没有选择type时的默认列表
    const initNotypeList = async (page = 1) => {
      const start = (page - 1) * PAGE_SIZE
      const {results : resList, count} = await geInitList(PAGE_SIZE, start);
      setTotal(count);
      const newShowList = resList.map((r: any) => r.name)
      await getAllPokemonInfo(newShowList, 1);
      setShowList(newShowList);
    }
    // 无筛选项时的翻页
    const onNoTypePreviousPage = async () => {
      if (page === 1) return;
      const nextPage = page - 1;
      initNotypeList(nextPage)
      setPage(nextPage);
      setUrlSearch([], nextPage);
    }
    const onNoTypeNextPage = async () => {
      const nextPage = page + 1;
      initNotypeList(nextPage)
      setPage(nextPage);
      setUrlSearch([], nextPage);
    }

    useEffect(() => {
      const urlPage = Number(searchParams.get('page'));
      const urlType = searchParams.get('type') ? searchParams.get('type')?.split(',') : '';
      if (urlPage) {
        setPage(urlPage);
      }
      if (urlType) {
        setSelect(urlType.join(','));
        setInitData(urlType, urlPage);
      } else {
        initNotypeList(urlPage || 1);
      }
    }, [])
  
    return (
        <div>
          <section className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>types: </div>
            {list.map((item: {name:string, url:string}) => (
              <div
                className={`border p-4 cursor-pointer ${select.length && select.indexOf(item.name) !== -1 ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => {onTriggerItem(item)}} 
                key={item.name}
              >{item.name}</div>
            ))}
          </section>

          {loading && <div className="flex flex-wrap justify-center p-10">Loading...</div>}

          {!loading && <section className="grid grid-cols-6 gap-16 pt-6">
            {!!select && showList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item:any) => {
              return <PokemonBox key={item} item={infoObj[item] || {}} />
            })}
            {!select && showList.map((item:any) => {
              return <PokemonBox key={item} item={infoObj[item] || {}} />
            })}
          </section>}

          {showList.length > PAGE_SIZE && !loading && (
            <div className="flex flex-wrap items-center justify-center mt-10">
              {page > 1 && <div onClick={onPreviousPage} className="rounded bg-blue-500 px-4 py-2 text-white cursor-pointer">Previous</div>}
              <div className="mx-6">第{page}页</div>
              {page < Math.ceil(showList.length / PAGE_SIZE) && (
                <div onClick={onNextPage} className="rounded bg-blue-500 px-4 py-2 text-white cursor-pointer">Next</div>
              )}
              <div className="mx-6">total:{showList.length}</div>
            </div>
          )} 

          {/* 无筛选项时的翻页器 */}
          {!select && !loading && (
            <div className="flex flex-wrap items-center justify-center mt-10">
              {page > 1 && <div onClick={onNoTypePreviousPage} className="rounded bg-blue-500 px-4 py-2 text-white cursor-pointer">Previous</div>}
              <div className="mx-6">第{page}页</div>
              {page < Math.ceil(total / PAGE_SIZE) && (
                <div onClick={onNoTypeNextPage} className="rounded bg-blue-500 px-4 py-2 text-white cursor-pointer">Next</div>
              )}
              <div className="mx-6">total:{total}</div>
            </div>
          )} 
        </div>
    );
  }
  