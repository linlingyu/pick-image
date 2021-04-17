import path from "path";
import os from "os";
import fs from "fs-extra";
import React, { useState, useEffect } from "react";
import { Card, Form, Button, Tag, List, Modal } from "antd";
import {nanoid} from "nanoid";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import "antd/dist/antd.dark.css";
import style from "./assets/less/app.less";
import { ipcRenderer, IpcRendererEvent } from "electron";
// 
export function App(): JSX.Element {
    const [sourcePaths, setSourcePaths] = useState<string[]>([]),
        [targetPath, setTargetPath] = useState<string>(path.join(os.homedir(), 'Desktop', 'pic')),
        [listLoading, setListLoading] = useState<boolean>(false),
        [loading, setLoading] = useState<boolean>(false),
        [visible, setVisible] = useState<boolean>(false);
    // 
    useEffect(() => {
        ipcRenderer.on('BROWSE_SOURCE-REPLY', (event: IpcRendererEvent, {directories}) => {
            setSourcePaths(directories);
            setListLoading(false);
        });
        // 
    }, []);
    // 
    function onBrowse() {
        setListLoading(true);
        ipcRenderer.send('BROWSE_SOURCE');
    }

    function onChangeTarget() {
        const filePath: string = ipcRenderer.sendSync('CHANGE_TARGET', {filePath: targetPath});
        if (!filePath) {
            return;
        }
        setTargetPath(filePath);
    }
    // 
    function onSubmit(values: any) {
        if (!sourcePaths.length) {
            Modal.error({
                title: 'Error',
                content: '请选择一个图片目录！'
            });
            return;
        }
        fs.ensureDirSync(targetPath);
        const files: string[] = fs.readdirSync(targetPath).filter((item: string) => !item.match(/^\./));
        if (files.length) {
            setVisible(true);
            return;
        }
        copyJPG();
    }

    async function onCopy(type: number) {
        setVisible(false);
        setLoading(true);
        if (type === 1) { // 清空复制
            await fs.remove(targetPath);
        }
        return copyJPG();
    }

    async function copyJPG() {
        setLoading(true);
        // 
        let files: string[] = [];
        for(let i = 0; i < sourcePaths.length; i++) {
            const directory: string = sourcePaths[i],
                fileList: string[] = await fs.readdir(directory);
            files = files.concat(fileList.map((fileName: string) => path.join(directory, fileName)));
        }
        // 
        files = files.filter((filePath: string) => filePath.match(/\.jpg$/i));
        const promiseArray: Promise<any>[] = files.map((filePath: string) => {
            return fs.copy(filePath, path.join(targetPath, path.basename(filePath)));
        });
        return Promise.all(promiseArray)
            .then(() => {
                Modal.success({
                    title: 'Success',
                    content: '复制完成'
                });
                setLoading(false);
            });
    }

    return <>
        <Card className={style.container} title="Pick Image">
            <Form name="myform" onFinish={onSubmit}>
                <div className={style.fieldItem}>
                    请选择要复制的目录：
                    <Button onClick={onBrowse} size="small">Browse</Button>
                </div>
                <List
                    bordered
                    size="small"
                    loading={listLoading}
                    dataSource={sourcePaths}
                    renderItem={(item: string) => <List.Item>{item}</List.Item>}
                />
                <br/>
                <div className={style.fieldItem}>
                    请选择目标路径：
                    <Button onClick={onChangeTarget} size="small">更换目标目录</Button>
                </div>
                当前目标目录：<Tag color="green">{targetPath}</Tag>
                <div className={style.fieldItem}>
                    <Button type="primary" htmlType="submit" loading={loading}>Submit</Button>
                </div>
            </Form>
        </Card>
        <Modal
            title="Warning"
            visible={visible}
            onCancel={() => setVisible(false)}
            footer={[
                <Button key={nanoid(8)} loading={loading} danger type="primary" onClick={() => onCopy(1)}>清空复制</Button>,
                <Button key={nanoid(8)} loading={loading} type="primary" onClick={() => onCopy(2)}>追加复制</Button>,
                <Button key={nanoid(8)} loading={loading} onClick={() => setVisible(false)}>取消</Button>
            ]}
        >
            <p>目标目录存在文件，请做选择！</p>
            <p>注意：选择清空复制将会清空目标目录的所有文件！</p>
        </Modal>
    </>
}