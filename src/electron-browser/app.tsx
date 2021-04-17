import path from "path";
import os from "os";
import fs from "fs-extra";
import React, { useState } from "react";
import { Card, Form, Button, Tag, List, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import "antd/dist/antd.dark.css";
import style from "./assets/less/app.less";
import { ipcRenderer } from "electron";
// 
export function App(): JSX.Element {
    const [sourcePaths, setSourcePaths] = useState<string[]>([]),
        [targetPath, setTargetPath] = useState<string>(path.join(os.homedir(), 'Desktop', 'pic')),
        [loading, setLoading] = useState<boolean>(false),
        [visible, setVisible] = useState<boolean>(false);
    // 
    function onBrowse() {
        const filePaths: string[] = ipcRenderer.sendSync('BROWSE_SOURCE');
        setSourcePaths(filePaths);
    }

    function onChangeTarget() {
        const filePath: string = ipcRenderer.sendSync('CHANGE_TARGET', {filePath: targetPath});
        if (!filePath) {
            return;
        }
        setTargetPath(filePath);
    }

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

    function onCleanToCopy() {
        setLoading(true);
        setVisible(false);
        fs.removeSync(targetPath);
        copyJPG();
    }
    function onCopy() {
        setVisible(false);
        copyJPG();
    }

    function copyJPG() {
        setLoading(true);
        let files: string[] = [];
        sourcePaths.forEach((dir: string) => {
            files = files.concat(fs.readdirSync(dir).filter((fileName: string) => fileName.match(/\.jpg$/i)).map((fileName: string) => path.join(dir, fileName)));
        });
        files.forEach((filePath: string) => {
            fs.copySync(filePath, path.join(targetPath, path.basename(filePath)));
        });
        Modal.success({
            title: 'Success',
            content: '复制完成'
        });
        setLoading(false);
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
                <Button loading={loading} danger type="primary" onClick={onCleanToCopy}>清空复制</Button>,
                <Button loading={loading} type="primary" onClick={onCopy}>追加复制</Button>,
                <Button loading={loading} onClick={() => setVisible(false)}>取消</Button>
            ]}
        >
            <p>目标目录存在文件，请做选择！</p>
            <p>注意：选择清空复制将会清空目标目录的所有文件！</p>
        </Modal>
    </>
}